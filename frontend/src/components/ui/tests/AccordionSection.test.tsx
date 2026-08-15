import { render, screen, fireEvent } from '@testing-library/react'
import AccordionSection from '../AccordionSection'

jest.mock('lucide-react', () => ({
  ChevronDown: () => <span data-testid="chevron-icon">ChevronDown</span>,
}))


describe('AccordionSection', () => {
  const mockOnToggle = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title', () => {


    render(
      <AccordionSection title="Test Title" isOpen={false} OnToggle={mockOnToggle}>
        <div>Content</div>
      </AccordionSection>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()

  })

  it('renders children when isOpen is true', () => {

    render(
      <AccordionSection title="Test Title" isOpen={true} OnToggle={mockOnToggle}>
        <div>Test Content</div>

      </AccordionSection>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('does not render children when isOpen is false', () => {

    render(
      <AccordionSection title="Test Title" isOpen={false} OnToggle={mockOnToggle}>

        <div>Test Content</div>
      </AccordionSection>
    )
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
  })

  it('calls OnToggle when button is clicked', () => {
    render(
      <AccordionSection title="Test Title" isOpen={false} OnToggle={mockOnToggle}>
        <div>Content</div>

      </AccordionSection>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)


    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('renders chevron with correct rotation when isOpen is true', () => {
    render(
        <AccordionSection title="Test Title" isOpen={true} OnToggle={mockOnToggle}>
        <div>Content</div>
        </AccordionSection>
    )
    const chevron = screen.getByTestId('chevron-icon')
    
    expect(chevron).toBeInTheDocument()
    
    const button = screen.getByRole('button')
    expect(button).toContainElement(chevron)
    })

    it('renders chevron without rotation when isOpen is false', () => {
    render(
        
        <AccordionSection title="Test Title" isOpen={false} OnToggle={mockOnToggle}>
        <div>Content</div>
        </AccordionSection>
    )
    const chevron = screen.getByTestId('chevron-icon')
    expect(chevron).toBeInTheDocument()
    })
})