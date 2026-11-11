import toast from 'react-hot-toast';

export function printOrderInvoice(order: any): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const itemsHtml = order.items
    .map(
      (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || 'Item'} ${
        item.color && item.color !== 'N/A' ? '(' + item.color + ')' : ''
      }</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Tk ${item.price}</td>
        </tr>
      `
    )
    .join('');

  const html = `
        <html>
          <head>
            <title>Invoice - #${String(order.id).slice(-6).toUpperCase()}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
              .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
              .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              th { text-align: left; padding: 10px; background: #f9fafb; border-bottom: 2px solid #eee; }
              .totals { width: 300px; margin-left: auto; }
              .tot-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .tot-row.grand { font-weight: bold; font-size: 18px; border-bottom: none; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 style="margin:0; color: #4F46E5;">INVOICE</h1>
                <p style="margin:5px 0 0 0; color: #666;">Order #${String(order.id).slice(-6).toUpperCase()}</p>
                <p style="margin:5px 0 0 0; color: #666;">Date: ${order.date}</p>
              </div>
            </div>
            
            <div class="details">
              <div>
                <h3 style="margin-top:0; color: #666; font-size: 14px; text-transform: uppercase;">Bill To:</h3>
                <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 16px;">${order.customerName}</p>
                <p style="margin: 0 0 5px 0;">${order.customerPhone}</p>
                <p style="margin: 0;">${order.address}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div class="totals">
              <div class="tot-row">
                <span>Subtotal</span>
                <span>Tk ${order.items.reduce(
                  (acc: number, item: any) => acc + item.price * item.quantity,
                  0
                )}</span>
              </div>
              <div class="tot-row">
                <span>Delivery Charge</span>
                <span>Tk ${order.deliveryCharge}</span>
              </div>
              <div class="tot-row grand">
                <span>Total</span>
                <span>Tk ${order.total}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 80px; color: #888; font-size: 12px;">
              <p>Thank you for shopping with us!</p>
            </div>
            
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.onafterprint = () => window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;
  printWindow.document.write(html);
  printWindow.document.close();
}

export function downloadOrdersCSV(
  orderHistory: any[],
  filterType: 'daily' | 'weekly' | 'monthly' | 'all'
): void {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filteredOrders = orderHistory.filter((order) => {
    if (filterType === 'all') return true;

    let orderDate: Date;
    const createdAt = order.createdAt;
    if (createdAt) {
      if (typeof createdAt.toDate === 'function') {
        orderDate = createdAt.toDate();
      } else if (typeof createdAt === 'object' && createdAt.seconds) {
        orderDate = new Date(createdAt.seconds * 1000);
      } else {
        orderDate = new Date(createdAt);
      }
    } else {
      orderDate = new Date();
    }
    if (filterType === 'daily') {
      return orderDate >= startOfToday;
    } else if (filterType === 'weekly') {
      return orderDate >= sevenDaysAgo;
    } else if (filterType === 'monthly') {
      return orderDate >= thirtyDaysAgo;
    }
    return true;
  });

  if (filteredOrders.length === 0) {
    toast.error('এই সময়ের কোনো অর্ডার পাওয়া যায়নি!');
    return;
  }

  const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Total', 'Status'];
  const escapeCSV = (val: any) => {
    const str = val === undefined || val === null ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [headers.join(',')];
  filteredOrders.forEach((o) => {
    const row = [
      escapeCSV(o.id),
      escapeCSV(o.date),
      escapeCSV(o.customerName),
      escapeCSV(o.customerPhone),
      escapeCSV(o.total),
      escapeCSV(o.status),
    ];
    csvRows.push(row.join(','));
  });

  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `orders_${filterType}_${new Date().toLocaleDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
