import { Navigate } from 'react-router-dom';
import Home from './Home';

// Index now just renders Home - auth is handled by AppLayout
const Index = () => {
  return <Home />;
};

export default Index;