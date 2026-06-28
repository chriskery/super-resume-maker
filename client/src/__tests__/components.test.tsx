import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Resume } from '../types/resume';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock api for CreateResumeModal
const mockCreate = vi.fn();
vi.mock('../services/api', () => ({
  resumeApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: (...args: any[]) => mockCreate(...args),
    update: vi.fn(),
    patch: vi.fn(),
    duplicate: vi.fn(),
    delete: vi.fn(),
  },
}));

// Import components after mocks
const { default: ResumeCard } = await import('../components/ResumeCard');
const { default: CreateResumeModal } = await import('../components/CreateResumeModal');

const emptyOthers = { certificates: [], languages: [], hobbies: [], activities: [] };

const mockResume: Resume = {
  id: 'test-id-1',
  title: '我的测试简历',
  templateId: 'professional',
  personalInfo: { name: '王五', phone: '13700137000', email: 'w@x.com', title: '产品经理' },
  summary: '一段简介',
  education: [],
  workExperience: [],
  projectExperience: [],
  organizationExperience: [],
  awards: [],
  skills: [],
  others: emptyOthers,
  tags: [],
  createdAt: '2024-03-01T10:00:00.000Z',
  updatedAt: '2024-03-15T14:30:00.000Z',
};

describe('ResumeCard', () => {
  const mockOnDelete = vi.fn();
  const mockOnDuplicate = vi.fn();
  const mockOnRename = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the resume title', () => {
    render(<ResumeCard resume={mockResume} onDelete={mockOnDelete} onDuplicate={mockOnDuplicate} onRename={mockOnRename} />);
    expect(screen.getByText('我的测试简历')).toBeInTheDocument();
  });

  it('should render the template name mapping', () => {
    render(<ResumeCard resume={mockResume} onDelete={mockOnDelete} onDuplicate={mockOnDuplicate} onRename={mockOnRename} />);
    expect(screen.getByText('专业模板')).toBeInTheDocument();
  });

  it('should render edit and delete buttons', () => {
    render(<ResumeCard resume={mockResume} onDelete={mockOnDelete} onDuplicate={mockOnDuplicate} onRename={mockOnRename} />);
    expect(screen.getByText('编辑')).toBeInTheDocument();
    expect(screen.getByText('删除')).toBeInTheDocument();
  });

  it('should call navigate when edit button is clicked', () => {
    render(<ResumeCard resume={mockResume} onDelete={mockOnDelete} onDuplicate={mockOnDuplicate} onRename={mockOnRename} />);
    fireEvent.click(screen.getByText('编辑'));
    expect(mockNavigate).toHaveBeenCalledWith('/editor/test-id-1');
  });

  it('should call onDelete with resume id when delete button is clicked', () => {
    render(<ResumeCard resume={mockResume} onDelete={mockOnDelete} onDuplicate={mockOnDuplicate} onRename={mockOnRename} />);
    fireEvent.click(screen.getByText('删除'));
    expect(mockOnDelete).toHaveBeenCalledWith('test-id-1');
  });

  it('should display templateId directly if no mapping exists', () => {
    const customResume = { ...mockResume, templateId: 'custom-template' };
    render(<ResumeCard resume={customResume} onDelete={mockOnDelete} onDuplicate={mockOnDuplicate} onRename={mockOnRename} />);
    expect(screen.getByText('custom-template')).toBeInTheDocument();
  });
});

describe('CreateResumeModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open=false', () => {
    render(<CreateResumeModal open={false} onClose={mockOnClose} />);
    expect(screen.queryByText('新建简历')).not.toBeInTheDocument();
  });

  it('should render modal with title input and template selection when open=true', () => {
    render(<CreateResumeModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('新建简历')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例如：我的简历')).toBeInTheDocument();
    expect(screen.getByText('专业模板')).toBeInTheDocument();
    expect(screen.getByText('简约模板')).toBeInTheDocument();
    expect(screen.getByText('现代模板')).toBeInTheDocument();
  });

  it('should show error when creating with empty title', async () => {
    render(<CreateResumeModal open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('创建'));
    expect(await screen.findByText('请输入简历标题')).toBeInTheDocument();
  });

  it('should allow template selection', () => {
    render(<CreateResumeModal open={true} onClose={mockOnClose} />);
    // Click on "简约模板"
    fireEvent.click(screen.getByText('简约模板'));
    // The minimal template button should now have the active class (border-blue-500)
    const minimalBtn = screen.getByText('简约模板').closest('button');
    expect(minimalBtn?.className).toContain('border-blue-500');
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<CreateResumeModal open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('取消'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
