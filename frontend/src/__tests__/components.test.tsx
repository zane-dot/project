import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

describe('<StatCard />', () => {
  it('renders the label and value', () => {
    render(<StatCard label="本月收入" value="¥1,234.00" />);
    expect(screen.getByText('本月收入')).toBeInTheDocument();
    expect(screen.getByText('¥1,234.00')).toBeInTheDocument();
  });

  it('renders the trend hint when provided', () => {
    render(<StatCard label="x" value="1" trend="较上月 +12%" />);
    expect(screen.getByText('较上月 +12%')).toBeInTheDocument();
  });
});

describe('<EmptyState />', () => {
  it('renders title and description', () => {
    render(<EmptyState title="没有数据" description="去添加一条吧" />);
    expect(screen.getByText('没有数据')).toBeInTheDocument();
    expect(screen.getByText('去添加一条吧')).toBeInTheDocument();
  });

  it('renders an optional action node', () => {
    render(
      <EmptyState title="x" action={<button type="button">新增</button>} />,
    );
    expect(screen.getByRole('button', { name: '新增' })).toBeInTheDocument();
  });
});
