import { render, screen } from '@/test-utils';
import ErrorText from '../ErrorText';

describe('ErrorText', () => {
  it('renders children', () => {


    render(<ErrorText>This field is required</ErrorText>);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies form-error class', () => {

    render(<ErrorText>Error message</ErrorText>);

    
    expect(screen.getByText('Error message')).toHaveClass('form-error');
  });
});
