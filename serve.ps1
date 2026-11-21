# Simple, high-performance static HTTP server for Still Point landing page
param(
    [int]$Port = 5500
)

$code = @'
using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Collections.Generic;

public class StaticServer {
    private HttpListener _listener;
    private string _root;
    private volatile bool _running;
    private static readonly Dictionary<string, string> Mimes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
        { ".html", "text/html; charset=utf-8" },
        { ".css", "text/css; charset=utf-8" },
        { ".js", "application/javascript; charset=utf-8" },
        { ".json", "application/json; charset=utf-8" },
        { ".png", "image/png" },
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".gif", "image/gif" },
        { ".svg", "image/svg+xml" },
        { ".mp4", "video/mp4" },
        { ".webm", "video/webm" },
        { ".woff", "font/woff" },
        { ".woff2", "font/woff2" },
        { ".ttf", "font/ttf" }
    };

    public StaticServer(string root, int port) {
        _root = root;
        _listener = new HttpListener();
        _listener.Prefixes.Add("http://localhost:" + port + "/");
    }

    public void Start() {
        _listener.Start();
        _running = true;
        ThreadPool.QueueUserWorkItem(_ => ListenLoop());
    }

    public void Stop() {
        _running = false;
        try { _listener.Stop(); } catch {}
    }

    private void ListenLoop() {
        while (_running) {
            try {
                var context = _listener.GetContext();
                ThreadPool.QueueUserWorkItem(s => HandleRequest((HttpListenerContext)s), context);
            } catch {
                if (!_running) break;
            }
        }
    }

    private void HandleRequest(HttpListenerContext context) {
        try {
            var req = context.Request;
            var res = context.Response;

            string path = req.Url.LocalPath.TrimStart('/');
            if (string.IsNullOrEmpty(path) || path.EndsWith("/")) {
                path = Path.Combine(path, "index.html");
            }
            path = Uri.UnescapeDataString(path).Replace('/', Path.DirectorySeparatorChar);
            string fullPath = Path.Combine(_root, path);

            if (File.Exists(fullPath)) {
                string ext = Path.GetExtension(fullPath);
                string mime;
                if (!Mimes.TryGetValue(ext, out mime)) {
                    mime = "application/octet-stream";
                }
                res.ContentType = mime;
                res.AddHeader("Accept-Ranges", "bytes");

                var fi = new FileInfo(fullPath);
                long totalLength = fi.Length;
                string range = req.Headers["Range"];

                if (!string.IsNullOrEmpty(range) && range.StartsWith("bytes=")) {
                    string r = range.Substring(6);
                    string[] parts = r.Split('-');
                    long start = 0;
                    long end = totalLength - 1;

                    if (!string.IsNullOrEmpty(parts[0])) {
                        start = long.Parse(parts[0]);
                    }
                    if (parts.Length > 1 && !string.IsNullOrEmpty(parts[1])) {
                        end = long.Parse(parts[1]);
                    }
                    if (end >= totalLength) end = totalLength - 1;
                    if (start > end || start >= totalLength) {
                        res.StatusCode = 416;
                        res.AddHeader("Content-Range", "bytes */" + totalLength);
                        res.Close();
                        return;
                    }

                    long count = end - start + 1;
                    res.StatusCode = 206;
                    res.AddHeader("Content-Range", string.Format("bytes {0}-{1}/{2}", start, end, totalLength));
                    res.ContentLength64 = count;

                    using (var fs = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read)) {
                        fs.Seek(start, SeekOrigin.Begin);
                        byte[] buffer = new byte[65536];
                        long remaining = count;
                        while (remaining > 0) {
                            int toRead = (int)Math.Min(buffer.Length, remaining);
                            int read = fs.Read(buffer, 0, toRead);
                            if (read <= 0) break;
                            res.OutputStream.Write(buffer, 0, read);
                            remaining -= read;
                        }
                    }
                } else {
                    res.StatusCode = 200;
                    res.ContentLength64 = totalLength;
                    using (var fs = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read)) {
                        fs.CopyTo(res.OutputStream);
                    }
                }
            } else {
                res.StatusCode = 404;
                byte[] notFound = System.Text.Encoding.UTF8.GetBytes("404 Not Found");
                res.OutputStream.Write(notFound, 0, notFound.Length);
            }
            res.Close();
        } catch {
            try { context.Response.Close(); } catch {}
        }
    }
}
'@

Add-Type -TypeDefinition $code -Language CSharp

$server = $null
try {
    $server = [StaticServer]::new($PSScriptRoot, $Port)
    $server.Start()
} catch {
    Write-Warning "Port $Port could not be opened, trying 8080: $_"
    $Port = 8080
    $server = [StaticServer]::new($PSScriptRoot, $Port)
    $server.Start()
}

$url = "http://localhost:$Port/"
Write-Host "Server running at $url"
Start-Process $url

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    if ($server) {
        $server.Stop()
    }
}
