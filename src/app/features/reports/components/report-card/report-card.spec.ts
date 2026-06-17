import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReportCard } from './report-card';
import { ReportSummary } from '@features/reports/models/report.model';
import { ConfirmService } from '@core/services/confirm.service';

const mockConfirmService = { confirm: vi.fn() };

const makeSummary = (overrides: Partial<ReportSummary> = {}): ReportSummary => ({
  id: 1, title: 'Q1 Review', introduction: null,
  authorId: 1, authorName: 'Alice',
  projectId: 1, projectName: 'GTN',
  createdAt: '2024-01-01T00:00:00', updatedAt: null,
  itemCount: 0, statusCounts: {},
  ...overrides,
});

describe('ReportCard — statusBadges computed', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReportCard],
      providers: [{ provide: ConfirmService, useValue: mockConfirmService }],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  function create(report: ReportSummary, isOwner = true) {
    const fixture = TestBed.createComponent(ReportCard);
    fixture.componentRef.setInput('report', report);
    fixture.componentRef.setInput('isOwner', isOwner);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('returns empty array when statusCounts is empty', () => {
    const comp = create(makeSummary({ statusCounts: {} }));
    expect(comp.statusBadges()).toEqual([]);
  });

  it('returns empty array when statusCounts is null/undefined', () => {
    const comp = create(makeSummary({ statusCounts: null as any }));
    expect(comp.statusBadges()).toEqual([]);
  });

  it('REP-18 returns badges for non-zero counts', () => {
    const comp = create(makeSummary({ statusCounts: { APPROVED: 3, REJECTED: 1, DRAFT: 0 } }));
    const badges = comp.statusBadges();
    expect(badges.length).toBe(2);
    expect(badges.some(b => b.status === 'APPROVED')).toBe(true);
    expect(badges.some(b => b.status === 'REJECTED')).toBe(true);
    expect(badges.some(b => b.status === 'DRAFT')).toBe(false);
  });

  it('REP-18 badge label shows count and title-cased status', () => {
    const comp = create(makeSummary({ statusCounts: { APPROVED: 2 } }));
    const badge = comp.statusBadges()[0];
    expect(badge.label).toBe('2 Approved');
  });

  it('filters out counts of zero', () => {
    const comp = create(makeSummary({ statusCounts: { DRAFT: 0, PROPOSED: 0 } }));
    expect(comp.statusBadges()).toEqual([]);
  });
});
