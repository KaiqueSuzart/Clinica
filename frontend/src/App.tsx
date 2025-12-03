import React from 'react';
import { AuthProvider } from './components/Auth/AuthProvider';
import Layout from './components/Layout/Layout';
import UpdatePrompt from './components/PWA/UpdatePrompt';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Layout />
        <UpdatePrompt />
      </div>
    </AuthProvider>
  );
}

export default App;