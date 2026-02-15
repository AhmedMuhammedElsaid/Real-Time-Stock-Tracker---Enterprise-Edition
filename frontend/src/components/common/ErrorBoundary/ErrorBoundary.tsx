import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.css';
import ReloadButton from '../ReloadButton/ReloadButton';


interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}


export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary [${this.props.name || 'Global'}]:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-fallback">
          <h2>Something went wrong.</h2>
          <p>We encountered an error while rendering this component.</p>
          <ReloadButton />
        </div>
      );
    }

    return this.props.children;
  }
}
