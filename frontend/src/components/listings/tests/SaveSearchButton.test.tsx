import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SaveSearchButton from '../SaveSearchButton'
import { createSavedSearch } from '@/lib/saved-searches.api'


jest.mock('@/lib/saved-searches.api', () => ({
  createSavedSearch: jest.fn(),
}))


jest.mock('lucide-react', () => ({

  Bookmark: () => <span data-testid="bookmark-icon">Bookmark</span>,


  BookmarkCheck: () => <span data-testid="bookmark-check-icon">BookmarkCheck</span>,
  Loader2: () => <span data-testid="loader-icon">Loader2</span>,

}))

describe('SaveSearchButton', () => {
    
  const mockOnSave = jest.fn()
  const mockFilters = {
    faculty: 'EBIT',
    moduleCode: 'COS301',
    condition: 'good',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders button with "Save this search" text when no filters applied', () => {

    render(<SaveSearchButton filters={{}} onSave={mockOnSave} />)
    expect(screen.getByText('Save this search')).toBeInTheDocument()

    expect(screen.getByTestId('bookmark-icon')).toBeInTheDocument()
  })

  it('renders button with filters applied', () => {

    render(<SaveSearchButton filters={mockFilters} onSave={mockOnSave} />)
    const button = screen.getByRole('button')


    expect(button).toBeEnabled()
    expect(screen.getByText('Save this search')).toBeInTheDocument()

  })

  it('shows helper text when no filters applied', () => {

    render(<SaveSearchButton filters={{}} onSave={mockOnSave} />)
    expect(screen.getByText('Apply filters to save this search')).toBeInTheDocument()
  })

  it('does not show helper text when filters are applied', () => {


    render(<SaveSearchButton filters={mockFilters} onSave={mockOnSave} />)
    expect(screen.queryByText('Apply filters to save this search')).not.toBeInTheDocument()

  })

  it('calls createSavedSearch and shows Saved! state on success', async () => {
    ;(createSavedSearch as jest.Mock).mockResolvedValueOnce({ id: '123' })

    render(<SaveSearchButton filters={mockFilters} onSave={mockOnSave} />)

    const button = screen.getByRole('button')
    
    fireEvent.click(button)

    await waitFor(() => {
      expect(createSavedSearch).toHaveBeenCalledWith(mockFilters)


      expect(screen.getByText('Saved!')).toBeInTheDocument()
      expect(screen.getByTestId('bookmark-check-icon')).toBeInTheDocument()

      expect(mockOnSave).toHaveBeenCalled()
    })
  })

  it('shows error message when save fails', async () => {
    ;(createSavedSearch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<SaveSearchButton filters={mockFilters} onSave={mockOnSave} />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows error when trying to save with no filters', async () => {


    render(<SaveSearchButton filters={{}} onSave={mockOnSave} />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)

    await waitFor(() => {



      expect(screen.getByText('Apply at minimum one filter before saving')).toBeInTheDocument()
    })
    expect(createSavedSearch).not.toHaveBeenCalled()
  })

  it('disables button while saving', async () => {
    ;(createSavedSearch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<SaveSearchButton filters={mockFilters} onSave={mockOnSave} />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()

      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    })


  })

  it('applies custom className', () => {


    render(<SaveSearchButton filters={mockFilters} onSave={mockOnSave} className="custom-class" />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('shows different button styles based on state', async () => {
    ;(createSavedSearch as jest.Mock).mockResolvedValueOnce({ id: '123' })


    render(<SaveSearchButton filters={mockFilters} onSave={mockOnSave} />)
    const button = screen.getByRole('button')
    
    
    expect(button).toHaveClass('bg-blue-50')
    
    
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toHaveClass('bg-green-100')
    })
  })

  
  it('resets Saved! state after 3 seconds', async () => {
    ;(createSavedSearch as jest.Mock).mockResolvedValueOnce({ id: '123' })

    render(<SaveSearchButton filters={mockFilters} onSave={mockOnSave} />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)

    
    await waitFor(() => {
      expect(screen.getByText('Saved!')).toBeInTheDocument()

      expect(button).toHaveClass('bg-green-100')
    })

    
    await new Promise(resolve => setTimeout(resolve, 3100))

    
    expect(screen.getByText('Save this search')).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-50')

  }, 5000) 
})