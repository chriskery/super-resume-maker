import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DynamicList from '../components/form/DynamicList';
import SummaryLine from '../components/form/SummaryLine';

interface TestItem {
  id: string;
  title: string;
  detail: string;
}

const baseItems: TestItem[] = [
  { id: '1', title: '项目A', detail: '详情A' },
  { id: '2', title: '项目B', detail: '详情B' },
];

const defaultProps = {
  items: baseItems,
  onAdd: vi.fn(),
  onRemove: vi.fn(),
  onUpdate: vi.fn(),
  renderSummary: (item: TestItem) => (
    <div data-testid={`summary-${item.id}`}>
      <span className="font-medium text-gray-700">{item.title || '未填写标题'}</span>
      <span className="text-gray-700">{item.detail}</span>
    </div>
  ),
  renderItem: (item: TestItem, _index: number, _onUpdate: (item: TestItem) => void) => (
    <div data-testid={`detail-${item.id}`}>
      <input defaultValue={item.title} data-testid={`input-${item.id}`} />
    </div>
  ),
  addLabel: '添加项目',
};

function renderList(overrides = {}) {
  return render(<DynamicList<TestItem> {...defaultProps} {...overrides} />);
}

describe('DynamicList 折叠/展开功能', () => {
  it('已有条目默认折叠，不显示详情', () => {
    renderList();
    // 摘要可见
    expect(screen.getByTestId('summary-1')).toBeInTheDocument();
    expect(screen.getByTestId('summary-2')).toBeInTheDocument();
    // 详情不可见（折叠）
    expect(screen.queryByTestId('detail-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('detail-2')).not.toBeInTheDocument();
  });

  it('点击摘要行展开对应条目，显示详情', () => {
    renderList();
    // 点击第一个条目的摘要区域
    fireEvent.click(screen.getByTestId('summary-1'));
    // 第一个条目展开
    expect(screen.getByTestId('detail-1')).toBeInTheDocument();
    // 第二个仍然折叠
    expect(screen.queryByTestId('detail-2')).not.toBeInTheDocument();
  });

  it('再次点击已展开的条目将其折叠', () => {
    renderList();
    // 展开
    fireEvent.click(screen.getByTestId('summary-1'));
    expect(screen.getByTestId('detail-1')).toBeInTheDocument();
    // 再次点击折叠
    fireEvent.click(screen.getByTestId('summary-1'));
    expect(screen.queryByTestId('detail-1')).not.toBeInTheDocument();
  });

  it('新增条目自动展开', () => {
    const newItem: TestItem = { id: '3', title: '项目C', detail: '详情C' };
    // 用 Controlled 方式模拟：先渲染 2 项，再渲染 3 项
    const { rerender } = render(
      <DynamicList<TestItem>
        {...defaultProps}
        items={baseItems}
        onAdd={() => {}}
      />
    );

    // 点击"添加"按钮
    fireEvent.click(screen.getByText('+ 添加项目'));

    // 模拟父组件更新 items（新增第3项）
    rerender(
      <DynamicList<TestItem>
        {...defaultProps}
        items={[...baseItems, newItem]}
        onAdd={() => {}}
      />
    );

    // 新条目自动展开
    expect(screen.getByTestId('detail-3')).toBeInTheDocument();
    // 旧条目仍折叠
    expect(screen.queryByTestId('detail-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('detail-2')).not.toBeInTheDocument();
  });

  it('展开多个条目互不影响', () => {
    renderList();
    fireEvent.click(screen.getByTestId('summary-1'));
    fireEvent.click(screen.getByTestId('summary-2'));
    // 两个都展开
    expect(screen.getByTestId('detail-1')).toBeInTheDocument();
    expect(screen.getByTestId('detail-2')).toBeInTheDocument();
    // 折叠第一个
    fireEvent.click(screen.getByTestId('summary-1'));
    expect(screen.queryByTestId('detail-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('detail-2')).toBeInTheDocument();
  });
});

describe('DynamicList renderSummary 完整性', () => {
  it('renderSummary 始终被调用，每个条目都渲染摘要', () => {
    renderList();
    expect(screen.getByTestId('summary-1')).toBeInTheDocument();
    expect(screen.getByTestId('summary-2')).toBeInTheDocument();
  });

  it('空字段显示占位文字', () => {
    const itemsWithEmpty: TestItem[] = [
      { id: '1', title: '', detail: '有内容' },
    ];
    renderList({ items: itemsWithEmpty });
    // renderSummary 中有 fallback: item.title || '未填写标题'
    expect(screen.getByText('未填写标题')).toBeInTheDocument();
  });

  it('有数据时显示实际值', () => {
    renderList();
    expect(screen.getByText('项目A')).toBeInTheDocument();
    expect(screen.getByText('项目B')).toBeInTheDocument();
  });
});

describe('DynamicList 展开/折叠全部', () => {
  it('多条目时显示“展开全部”按钮', () => {
    renderList();
    expect(screen.getByText('展开全部')).toBeInTheDocument();
  });

  it('单条目时不显示展开/折叠按钮', () => {
    renderList({ items: [baseItems[0]] });
    expect(screen.queryByText('展开全部')).not.toBeInTheDocument();
    expect(screen.queryByText('折叠全部')).not.toBeInTheDocument();
  });

  it('点击“展开全部”展开所有条目', () => {
    renderList();
    fireEvent.click(screen.getByText('展开全部'));
    expect(screen.getByTestId('detail-1')).toBeInTheDocument();
    expect(screen.getByTestId('detail-2')).toBeInTheDocument();
    // 按钮文案切换为“折叠全部”
    expect(screen.getByText('折叠全部')).toBeInTheDocument();
  });

  it('点击“折叠全部”折叠所有条目', () => {
    renderList();
    // 先展开全部
    fireEvent.click(screen.getByText('展开全部'));
    expect(screen.getByTestId('detail-1')).toBeInTheDocument();
    // 再折叠全部
    fireEvent.click(screen.getByText('折叠全部'));
    expect(screen.queryByTestId('detail-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('detail-2')).not.toBeInTheDocument();
    // 按钮文案切换回“展开全部”
    expect(screen.getByText('展开全部')).toBeInTheDocument();
  });

  it('部分展开时按钮显示“展开全部”，点击后全部展开', () => {
    renderList();
    // 只展开第一个
    fireEvent.click(screen.getByTestId('summary-1'));
    expect(screen.getByTestId('detail-1')).toBeInTheDocument();
    expect(screen.queryByTestId('detail-2')).not.toBeInTheDocument();
    // 按钮仍为“展开全部”
    expect(screen.getByText('展开全部')).toBeInTheDocument();
    // 点击展开全部
    fireEvent.click(screen.getByText('展开全部'));
    expect(screen.getByTestId('detail-1')).toBeInTheDocument();
    expect(screen.getByTestId('detail-2')).toBeInTheDocument();
  });
});

describe('SummaryLine 组件', () => {
  it('渲染多个 segment 用 · 分隔', () => {
    render(<SummaryLine segments={['公司A', '职位B']} />);
    expect(screen.getByText('公司A')).toBeInTheDocument();
    expect(screen.getByText('职位B')).toBeInTheDocument();
  });

  it('空 segment 显示灰色占位样式', () => {
    const { container } = render(<SummaryLine segments={['', '有值']} />);
    // 第一个 segment 为空，应该有 text-gray-400 class
    const spans = container.querySelectorAll('span');
    const firstTextSpan = spans[1]; // spans[0] is the wrapper
    expect(firstTextSpan.className).toContain('text-gray-400');
  });

  it('有 dateRange 时显示时间范围', () => {
    render(<SummaryLine segments={['学校']} dateRange={{ start: '2020-09', end: '2024-06' }} />);
    expect(screen.getByText('2020-09 - 2024-06')).toBeInTheDocument();
  });

  it('dateRange 空 start/end 显示占位文字', () => {
    render(<SummaryLine segments={['学校']} dateRange={{ start: '', end: '' }} />);
    expect(screen.getByText('开始时间 - 至今')).toBeInTheDocument();
  });

  it('无 dateRange 时不显示时间分隔符', () => {
    const { container } = render(<SummaryLine segments={['仅标题']} />);
    expect(container.textContent).not.toContain('|');
  });
});
