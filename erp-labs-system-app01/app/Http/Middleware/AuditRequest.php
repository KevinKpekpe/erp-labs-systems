<?php

namespace App\Http\Middleware;

use App\Services\AuditService;
use Closure;
use Illuminate\Http\Request;

class AuditRequest
{
    public function handle(Request $request, Closure $next)
    {
        $startedAt = microtime(true);

        $response = $next($request);

        $durationMs = (int) ((microtime(true) - $startedAt) * 1000);

        $status = method_exists($response, 'getStatusCode') ? $response->getStatusCode() : null;
        $method = $request->method();
        $mode = config('audit.requests', 'errors');

        $shouldLog = match ($mode) {
            'all' => true,
            'errors' => $status >= 400,
            'write' => in_array($method, ['POST','PUT','DELETE','PATCH'], true),
            default => false,
        };

        if ($shouldLog) {
            $body = json_encode($this->sanitize($request->all()));
            $max = config('audit.truncate_body_chars', 1000);
            if ($body !== null && strlen($body) > $max) {
                $body = substr($body, 0, $max) . '...';
            }

            $details = [
                'method' => $method,
                'path' => $request->path(),
                'status' => $status,
                'query' => $request->query(),
                'body' => $body,
                'duration_ms' => $durationMs,
            ];

            AuditService::log('REQUEST', null, null, json_encode($details));
        }

        return $response;
    }

    private function sanitize(array $data): array
    {
        $redactKeys = ['password','current_password','new_password','token','otp'];
        foreach ($data as $key => $value) {
            if (in_array($key, $redactKeys, true)) {
                $data[$key] = '******';
                continue;
            }
            if ($value instanceof \Illuminate\Http\UploadedFile) {
                $data[$key] = ['uploaded_file' => $value->getClientOriginalName()];
                continue;
            }
            if (is_array($value)) {
                $data[$key] = $this->sanitize($value);
            }
        }
        return $data;
    }
}


