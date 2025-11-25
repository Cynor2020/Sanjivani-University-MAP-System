import Papa from "papaparse";

export default function CSVExportButton({ filename, rows }) {
  const onClick = () => {
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return <button onClick={onClick} className="border px-3 py-1 rounded">Export CSV</button>;
}