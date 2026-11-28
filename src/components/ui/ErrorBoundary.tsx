import React from 'react';

interface Props {
  children: React.ReactNode;
  label?: string;
}

interface State {
  error: Error | null;
}

/** Keeps one failed section from blanking the whole faculty page. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`${this.props.label || 'Section'} failed to render:`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-[14px] border border-[#C58D98] bg-[#FAF0F2] p-6 text-center">
          <p className="text-sm font-bold text-[#542536]">
            {this.props.label || 'This section'} could not be displayed.
          </p>
          <p className="text-xs text-[#79666A] mt-1">{this.state.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-xs font-bold text-[#542536] underline cursor-pointer"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
