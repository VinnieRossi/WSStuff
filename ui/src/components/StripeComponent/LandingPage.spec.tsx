import LandingPage from './LandingPage';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LandingPage', () => {
  test('it renders properly', () => {
    render(<LandingPage />);
  });
});
