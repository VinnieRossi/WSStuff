import React from 'react';
import App from './App';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('App', () => {
  test('that it renders', async () => {
    render(<App />);

    const consoleSpy = jest.spyOn(console, 'log');

    const button = await screen.findByTestId('testButton');

    userEvent.click(button);

    expect(consoleSpy).toHaveBeenCalled();
  });
});
