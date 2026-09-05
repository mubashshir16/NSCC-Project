// Utility to export transactions to CSV file and trigger browser download

export function exportTransactionsToCsv(transactions, filename = null) {
  if (!transactions || transactions.length === 0) {
    alert("No transaction records available to export.");
    return false;
  }

  const headers = [
    "Transaction ID",
    "Book ID",
    "Book Title",
    "Author",
    "ISBN",
    "Issued To (Name)",
    "Issued To (Student ID)",
    "Issue Date",
    "Due Date",
    "Return Date",
    "Current Status",
    "Days Overdue"
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = transactions.map((t) => {
    const isOverdue = t.is_overdue || (t.days_overdue && t.days_overdue > 0);
    const statusText = t.status === 'issued' ? (isOverdue ? 'Overdue' : 'Active Loan') : 'Returned';
    
    return [
      escapeCsv(t.id),
      escapeCsv(t.book_id),
      escapeCsv(t.book_title || "Unknown Title"),
      escapeCsv(t.book_author || "Unknown Author"),
      escapeCsv(t.isbn || "—"),
      escapeCsv(t.student_name),
      escapeCsv(t.student_id),
      escapeCsv(t.issue_date),
      escapeCsv(t.due_date || "—"),
      escapeCsv(t.return_date || "Pending Return"),
      escapeCsv(statusText),
      escapeCsv(t.days_overdue || 0)
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().split("T")[0];
  const downloadName = filename || `NSCC_Library_Circulation_${today}.csv`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", downloadName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
