import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { VoteSummary } from './vote-summary';
import { Comment } from '@features/decisions/models/comment.model';

const makeComment = (id: number, vote: Comment['vote']): Comment => ({
  id,
  authorId: 1,
  authorName: 'Alice',
  content: 'comment',
  vote,
  decisionId: 1,
  createdAt: '2024-01-01T00:00:00',
});

describe('VoteSummary — computed vote counts', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VoteSummary],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('counts zero votes when comments list is empty', () => {
    const fixture = TestBed.createComponent(VoteSummary);
    fixture.componentRef.setInput('comments', []);
    const comp = fixture.componentInstance;
    expect(comp.approved()).toBe(0);
    expect(comp.rejected()).toBe(0);
    expect(comp.abstained()).toBe(0);
    expect(comp.totalVotes()).toBe(0);
  });

  it('counts approved votes correctly', () => {
    const fixture = TestBed.createComponent(VoteSummary);
    fixture.componentRef.setInput('comments', [
      makeComment(1, 'APPROVE'),
      makeComment(2, 'APPROVE'),
      makeComment(3, 'REJECT'),
    ]);
    expect(fixture.componentInstance.approved()).toBe(2);
  });

  it('counts rejected votes correctly', () => {
    const fixture = TestBed.createComponent(VoteSummary);
    fixture.componentRef.setInput('comments', [
      makeComment(1, 'APPROVE'),
      makeComment(2, 'REJECT'),
      makeComment(3, 'REJECT'),
    ]);
    expect(fixture.componentInstance.rejected()).toBe(2);
  });

  it('counts abstained votes correctly', () => {
    const fixture = TestBed.createComponent(VoteSummary);
    fixture.componentRef.setInput('comments', [
      makeComment(1, 'ABSTAIN'),
      makeComment(2, 'APPROVE'),
      makeComment(3, 'ABSTAIN'),
    ]);
    expect(fixture.componentInstance.abstained()).toBe(2);
  });

  it('excludes comments with null vote from all counts', () => {
    const fixture = TestBed.createComponent(VoteSummary);
    fixture.componentRef.setInput('comments', [
      makeComment(1, null),
      makeComment(2, null),
    ]);
    const comp = fixture.componentInstance;
    expect(comp.approved()).toBe(0);
    expect(comp.rejected()).toBe(0);
    expect(comp.abstained()).toBe(0);
    expect(comp.totalVotes()).toBe(0);
  });

  it('totalVotes equals the sum of all vote types', () => {
    const fixture = TestBed.createComponent(VoteSummary);
    fixture.componentRef.setInput('comments', [
      makeComment(1, 'APPROVE'),
      makeComment(2, 'REJECT'),
      makeComment(3, 'ABSTAIN'),
      makeComment(4, 'APPROVE'),
      makeComment(5, null),
    ]);
    const comp = fixture.componentInstance;
    expect(comp.totalVotes()).toBe(4); // null vote excluded
    expect(comp.totalVotes()).toBe(comp.approved() + comp.rejected() + comp.abstained());
  });
});
