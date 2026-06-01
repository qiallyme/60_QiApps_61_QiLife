import { useNavigate } from "react-router-dom";

type QuickCaptureProps = { onCaptured: () => void };

export function QuickCapture({ onCaptured }: QuickCaptureProps) {
  const navigate = useNavigate();

  function openCapture() {
    onCaptured();
    navigate("/capture");
  }

  return (
    <button type="button" className="capture-launch" onClick={openCapture}>
      <span className="capture-launch-kicker">Quick capture</span>
      <strong>Capture something new</strong>
      <span className="capture-launch-note">Raw text to draft to review to save</span>
    </button>
  );
}
