export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div className="confirm-icon">⚠️</div>
        <h4>Confirmar exclusão</h4>
        <p>{message || 'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.'}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Excluir</button>
        </div>
      </div>
    </div>
  );
}
