export default function DataTable({ columns, data }) {
  return (
    <div className="overflow-x-auto bg-white shadow rounded">
      <table className="min-w-full">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left p-2 border-b">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b">
              {columns.map((c) => (
                <td key={c.key} className="p-2">{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}