export default function CrudLegend({ create, read, update, delete: del }) {
  return (
    <div className="crud-legend">
      <div className="crud-legend-item is-create">
        <div className="crud-legend-head">
          <span className="crud-legend-dot" />
          <span className="crud-legend-label">CREATE</span>
        </div>
        <p className="crud-legend-desc">{create}</p>
      </div>
      <div className="crud-legend-item is-read">
        <div className="crud-legend-head">
          <span className="crud-legend-dot" />
          <span className="crud-legend-label">READ</span>
        </div>
        <p className="crud-legend-desc">{read}</p>
      </div>
      <div className="crud-legend-item is-update">
        <div className="crud-legend-head">
          <span className="crud-legend-dot" />
          <span className="crud-legend-label">UPDATE</span>
        </div>
        <p className="crud-legend-desc">{update}</p>
      </div>
      <div className="crud-legend-item is-delete">
        <div className="crud-legend-head">
          <span className="crud-legend-dot" />
          <span className="crud-legend-label">DELETE</span>
        </div>
        <p className="crud-legend-desc">{del}</p>
      </div>
    </div>
  );
}
