import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import LandingPage from './components/StripeComponent/LandingPage';

const App = (): JSX.Element => {
  return (
    <Router>
      <Switch>
        <Route path=''>
          <LandingPage />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
