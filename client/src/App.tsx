import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Basic Navigation Placeholder */}
        <header style={{ padding: '1rem', backgroundColor: '#2563eb', color: '#ffffff' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>SeatSync</h1>
        </header>

        {/* Main Content Area */}
        <main style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<h2>Welcome to SeatSync! Browsing shows...</h2>} />
            <Route path="/show/:id" element={<h2>Seat Map goes here</h2>} />
            <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;