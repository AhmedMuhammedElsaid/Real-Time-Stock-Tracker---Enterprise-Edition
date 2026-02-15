import ReloadButton from '../ReloadButton/ReloadButton';
import './Fallback.css';

export default function Fallback() {
    return <>
        <div className="fallback-container">
            Failed to render chart. No data available.
        </div>
        <ReloadButton />
    </>
}
