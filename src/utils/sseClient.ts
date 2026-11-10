/**
 * SSE (Server-Sent Events) over HTTP REST POST client utility.
 * Allows sending complex request payloads via POST body while receiving
 * real-time SSE event streams (progress, text chunks, and finalized payload).
 */

export interface SSEProgressEvent {
  step: number;
  total?: number;
  message: string;
  progress: number;
  details?: any;
}

export interface SSEChunkEvent {
  text: string;
  field?: string;
  index?: number;
}

export interface SSEOptions<T> {
  onProgress?: (event: SSEProgressEvent) => void;
  onChunk?: (chunk: SSEChunkEvent) => void;
  onComplete?: (result: T) => void;
  onError?: (error: Error | string) => void;
  signal?: AbortSignal;
}

/**
 * Executes a REST POST request expecting a Server-Sent Events (SSE) stream.
 * Automatically falls back to standard JSON parsing if the server returns application/json.
 */
export async function fetchSSE<T = any>(
  url: string,
  payload: any,
  options?: SSEOptions<T>
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream, application/json',
    },
    body: JSON.stringify(payload),
    signal: options?.signal,
  });

  if (!response.ok) {
    let errorMsg = `서버 응답 오류 (${response.status} ${response.statusText})`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore json parse error
    }
    const err = new Error(errorMsg);
    options?.onError?.(err);
    throw err;
  }

  const contentType = response.headers.get('content-type') || '';

  // Case 1: Server returned standard application/json
  if (!contentType.includes('text/event-stream')) {
    const data = (await response.json()) as T;
    options?.onComplete?.(data);
    return data;
  }

  // Case 2: Server returned Server-Sent Events stream
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('응답 스트림을 읽을 수 없습니다.');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let finalResult: T | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const normalized = buffer.replace(/\r\n/g, '\n');
      const blocks = normalized.split('\n\n');
      buffer = blocks.pop() || '';

      for (const block of blocks) {
        if (!block.trim()) continue;

        let eventType = 'message';
        let dataStr = '';

        const lines = block.split('\n');
        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            const val = line.slice(5).trim();
            dataStr += (dataStr ? '\n' : '') + val;
          }
        }

        if (!dataStr) continue;

        try {
          const parsed = JSON.parse(dataStr);

          if (eventType === 'progress') {
            options?.onProgress?.(parsed as SSEProgressEvent);
          } else if (eventType === 'chunk') {
            options?.onChunk?.(parsed as SSEChunkEvent);
          } else if (eventType === 'complete') {
            finalResult = (parsed.result !== undefined ? parsed.result : parsed) as T;
            options?.onComplete?.(finalResult);
          } else if (eventType === 'error') {
            const err = new Error(parsed.error || 'SSE 스트림 에러');
            options?.onError?.(err);
            throw err;
          } else {
            // General message event
            if (parsed.result !== undefined) {
              finalResult = parsed.result as T;
              options?.onComplete?.(finalResult);
            }
          }
        } catch (e: any) {
          // If data was raw chunk string
          if (eventType === 'chunk') {
            options?.onChunk?.({ text: dataStr });
          }
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log('SSE Stream cancelled by client');
      throw err;
    }
    options?.onError?.(err);
    throw err;
  }

  if (finalResult === null) {
    throw new Error('스트림이 완료되지 않았습니다.');
  }

  return finalResult;
}
