import { render, screen, fireEvent } from '@/test-utils';
import Modal from '../Modal';
//import { de } from 'zod/locales';

describe('Modal', () => {


    const defaultProps = {
        isOpen: true,

        title: 'Test Modal',
        children: <p>Modal content</p>,


        onClose: jest.fn(),
    };

    it('renders when isOpen is true', () => {
        render(<Modal {...defaultProps} />);


        expect(screen.getByText('Test Modal')).toBeInTheDocument();

        expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        render(<Modal {...defaultProps} isOpen={false} />);

        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('renders without title when not provided', () => {
        render(<Modal {...defaultProps} title={undefined} />);


        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = jest.fn();

        render(<Modal {...defaultProps} onClose={onClose} />);
        const closeButton = screen.getByText('×');

        
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});