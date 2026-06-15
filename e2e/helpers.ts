import * as fs from 'fs';
import { Page } from '@playwright/test';

export const API = 'http://localhost:8080/api';

/** Read JWT token from a saved Playwright storageState JSON file. */
export function getToken(authFile: string): string {
  const raw = JSON.parse(fs.readFileSync(`e2e/.auth/${authFile}.json`, 'utf-8'));
  const entry = raw.origins?.[0]?.localStorage?.find(
    (i: { name: string }) => i.name === 'auth_user'
  );
  return JSON.parse(entry?.value ?? '{}')?.token ?? '';
}

export interface DecisionPayload {
  title: string;
  context: string;
  decision: string;
  projectId: number;
  teamIds: number[];
  tagIds?: number[];
}

/** Create a decision via the REST API. Returns the new decision id. */
export async function createDecisionApi(
  page: Page,
  token: string,
  payload: DecisionPayload
): Promise<number> {
  const res = await page.request.post(`${API}/decisions`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: payload,
  });
  const body = await res.json();
  return body.id as number;
}

/** Update decision status via the REST API. Throws if the request fails. */
export async function updateStatusApi(
  page: Page,
  token: string,
  id: number,
  status: string
): Promise<void> {
  const res = await page.request.patch(`${API}/decisions/${id}/status`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { status },
  });
  if (!res.ok()) {
    throw new Error(`updateStatusApi(${id}, ${status}) failed: ${res.status()} ${await res.text()}`);
  }
}

/** Delete a decision via the REST API (admin token recommended). */
export async function deleteDecisionApi(
  page: Page,
  token: string,
  id: number
): Promise<void> {
  await page.request.delete(`${API}/decisions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Post a comment via the REST API, with optional vote. Returns the comment id. */
export async function createCommentApi(
  page: Page,
  token: string,
  decisionId: number,
  content: string,
  vote?: 'APPROVE' | 'REJECT' | 'ABSTAIN'
): Promise<number> {
  const res = await page.request.post(`${API}/decisions/${decisionId}/comments`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: vote ? { content, vote } : { content },
  });
  const body = await res.json();
  return body.id as number;
}

/** Create a tag via the REST API. Returns the new tag id. */
export async function createTagApi(
  page: Page,
  token: string,
  name: string,
  color: string
): Promise<number> {
  const res = await page.request.post(`${API}/tags`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { name, color },
  });
  const body = await res.json();
  return body.id as number;
}

/** Delete a tag via the REST API. */
export async function deleteTagApi(page: Page, token: string, id: number): Promise<void> {
  await page.request.delete(`${API}/tags/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Create a report via the REST API. Returns the new report id. */
export async function createReportApi(
  page: Page,
  token: string,
  title: string,
  decisionIds: number[],
  projectId: number
): Promise<number> {
  const res = await page.request.post(`${API}/reports`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { projectId, title, introduction: null, decisionIds },
  });
  const body = await res.json();
  return body.id as number;
}

/** Delete a report via the REST API. */
export async function deleteReportApi(
  page: Page,
  token: string,
  id: number
): Promise<void> {
  await page.request.delete(`${API}/reports/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Create a project via the REST API. Returns the new project id. */
export async function createProjectApi(
  page: Page,
  token: string,
  name: string,
  organizationId: number
): Promise<number> {
  const res = await page.request.post(`${API}/projects`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { name, description: null, organizationId },
  });
  const body = await res.json();
  return body.id as number;
}

/** Assign a team to a project via the REST API. */
export async function assignTeamToProjectApi(
  page: Page,
  token: string,
  projectId: number,
  teamId: number
): Promise<void> {
  await page.request.post(`${API}/projects/${projectId}/teams`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { teamId },
  });
}

/** Delete a project via the REST API. */
export async function deleteProjectApi(
  page: Page,
  token: string,
  id: number
): Promise<void> {
  await page.request.delete(`${API}/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
