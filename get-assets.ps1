# Downloads every photo and video this site uses into the assets folder.
# Run once:  right-click > Run with PowerShell   (or: powershell -ExecutionPolicy Bypass -File get-assets.ps1)
$ErrorActionPreference = 'Continue'
Set-Location -Path $PSScriptRoot
$assets = @(
  @("assets\img\intro-studio.jpg", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80"),
  @("assets\img\intro-mat.jpg", "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=700&q=80"),
  @("assets\img\practice-reformer.jpg", "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80"),
  @("assets\img\practice-mat.jpg", "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80"),
  @("assets\img\practice-vinyasa.jpg", "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=1200&q=80"),
  @("assets\img\practice-yin.jpg", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80"),
  @("assets\img\practice-prenatal.jpg", "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=1200&q=80"),
  @("assets\img\teacher-1.jpg", "https://images.unsplash.com/photo-1573384666979-2b1e160d2d08?auto=format&fit=crop&w=700&q=80"),
  @("assets\img\teacher-2.jpg", "https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=700&q=80"),
  @("assets\img\teacher-3.jpg", "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=700&q=80"),
  @("assets\video\hero-yoga.mp4", "https://www.pexels.com/download/video/6111096/"),
  @("assets\video\studio-film.mp4", "https://www.pexels.com/download/video/4057411/")
)
foreach ($a in $assets) {
  $out = $a[0]; $url = $a[1]
  if (Test-Path $out) { Write-Host "skip  $out"; continue }
  try { Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -MaximumRedirection 5; Write-Host "ok    $out" -ForegroundColor Green }
  catch { Write-Host "FAIL  $out  ($url)" -ForegroundColor Red }
}
Write-Host 'Done. Open index.html in your browser.'
