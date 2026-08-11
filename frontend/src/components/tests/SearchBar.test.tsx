import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchBar from '../SearchBar'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))


jest.mock('lucide-react', () => ({
  Search: () => <span data-testid="search-icon">SearchIcon</span>,
  X: () => <span data-testid="x-icon">XIcon</span>,
}))



describe('SearchBar', () => {
  const mockOnSearch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })


  it('renders search input with placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} />)

    const input = screen.getByPlaceholderText('Search by title, author, ISBN, or module...')

    expect(input).toBeInTheDocument()
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()

  })

  it('renders with custom placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} placeholder="Custom placeholder" />)

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })

  it('displays initial query value', () => {

    render(<SearchBar onSearch={mockOnSearch} initialQuery="test search" />)

    const input = screen.getByPlaceholderText('Search by title, author, ISBN, or module...')
    expect(input).toHaveValue('test search')
  })

  it('calls onSearch with trimmed query when search button is clicked', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    const input = screen.getByPlaceholderText('Search by title, author, ISBN, or module...')

    const searchButton = screen.getByText('SEARCH')

    fireEvent.change(input, { target: { value: '  test query  ' } })


    fireEvent.click(searchButton)

    expect(mockOnSearch).toHaveBeenCalledWith('test query')
  })

  
})