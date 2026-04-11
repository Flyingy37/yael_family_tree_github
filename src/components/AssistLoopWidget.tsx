import { useEffect } from 'react';

const ASSISTLOOP_SCRIPT_SRC = 'https://assistloop.ai/assistloop-widget.js';

declare global {
  interface Window {
    AssistLoopWidget?: {
      init: (options: { agentId: string }) => void;
    };
  }
}

const agentId =
  import.meta.env.NEXT_PUBLIC_ASSISTLOOP_AGENT_ID ??
  import.meta.env.VITE_ASSISTLOOP_AGENT_ID;

export default function AssistLoopWidget() {
  useEffect(() => {
    if (!agentId) return;

    const initWidget = () => {
      window.AssistLoopWidget?.init({ agentId });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-assistloop-widget="true"]'
    );

    if (existingScript) {
      if (window.AssistLoopWidget) {
        initWidget();
      } else {
        existingScript.addEventListener('load', initWidget, { once: true });
      }
      return () => {
        existingScript.removeEventListener('load', initWidget);
      };
    }

    const script = document.createElement('script');
    script.src = ASSISTLOOP_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.assistloopWidget = 'true';
    script.addEventListener('load', initWidget, { once: true });
    script.addEventListener('error', () => {
      console.warn('AssistLoop widget failed to load.');
    });

    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', initWidget);
    };
  }, []);

  return null;
}
