export default function ServerDown() {
  return (
    <div>
      <h1>Server Unavailable</h1>
      <p>We&apos;re unable to connect to the game server. Please try again later.</p>
      <button onClick={() => { window.location.href = '/'; }}>Return Home</button>
    </div>
  );
}
