import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CompletePage from './Pages/Home';
import TaxiOptions from './Pages/TaxiOptions';

import Navbar from './Components/Navbar';
import NotFound from './Components/NotFound';
// import Login from './Pages/LoginPage';
// import Register from './Pages/RegisterPage';
import Contact from './Pages/ContactPage';
import AboutUs from './Pages/AboutUsPage';
import Footer from './Components/Footer';
import { store } from './store/store';
import { Provider } from 'react-redux';
import ScrollToTop from './Components/ScrollToTop';
import OurFleet from './Pages/OurFleet';
import CarRentalDetails from './Pages/CarRentalDetails';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop />
        <Navbar />
        <div className="App">
          <Routes>
            <Route path="/" element={<CompletePage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            {/* <Route path="/login" element={<Login />} /> */}
            {/* <Route path="/register" element={<Register />} /> */}
            <Route path="/fleet" element={<OurFleet />} />
            <Route path="/transport-options" element={<TaxiOptions />} />
            <Route path="/car-rental/:carId" element={<CarRentalDetails />} />
            <Route path="/payment" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;