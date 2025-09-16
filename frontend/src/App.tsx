import React from 'react';
import { AuthProvider } from './components/Auth/AuthProvider';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Layout />
      </div>
    </AuthProvider>
  );
}

export default App;