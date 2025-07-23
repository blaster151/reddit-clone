import { render, screen, fireEvent } from '@testing-library/react';
import { AuthUI } from '../auth-ui';

describe('AuthUI', () => {
  it('renders login form by default', () => {
    render(<AuthUI />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it('switches to register form', () => {
    render(<AuthUI />);
    const registerTab = screen.getByText('Register');
    fireEvent.click(registerTab);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('shows validation error if fields are empty', () => {
    render(<AuthUI />);
    const submit = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submit);
    expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
  });

  it('calls onLogin with correct values', () => {
    const onLogin = jest.fn();
    render(<AuthUI onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(onLogin).toHaveBeenCalledWith('user', 'pass');
  });

  it('calls onRegister with correct values', () => {
    const onRegister = jest.fn();
    render(<AuthUI onRegister={onRegister} />);
    fireEvent.click(screen.getByText('Register'));
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(onRegister).toHaveBeenCalledWith('user', 'user@example.com', 'pass');
  });

  it('shows validation error if register fields are empty', () => {
    render(<AuthUI />);
    fireEvent.click(screen.getByText('Register'));
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
  });
}); 