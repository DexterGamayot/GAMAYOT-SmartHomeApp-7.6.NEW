import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config/api';

/** Error thrown for any failed API call. `status` is 0 for network problems. */
export class ApiError extends Error {
    status: number;
    details?: string[];

    constructor(message: string, status: number, details?: string[]) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

// Thin fetch wrapper used by IoTService.
// Add auth headers here later (e.g. Authorization: Bearer <token>).
export async function request<T>(
    path: string,
    options: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown } = {}
): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        let response: Response;
        try {
            response = await fetch(`${API_BASE_URL}${path}`, {
                method: options.method ?? 'GET',
                headers: { 'Content-Type': 'application/json' },
                body: options.body === undefined ? undefined : JSON.stringify(options.body),
                signal: controller.signal,
            });
        } catch {
            throw new ApiError('Cannot reach the server. Is the backend running?', 0);
        }

        if (!response.ok) {
            // The backend answers errors as { error: { message, details? } }.
            let message = `Request failed (${response.status}).`;
            let details: string[] | undefined;
            try {
                const payload = await response.json();
                message = payload?.error?.message ?? message;
                details = payload?.error?.details;
            } catch {
                // response had no JSON body — keep the generic message
            }
            throw new ApiError(details?.length ? `${message} ${details.join(' ')}` : message, response.status, details);
        }

        return (response.status === 204 ? undefined : await response.json()) as T;
    } finally {
        clearTimeout(timer);
    }
}
