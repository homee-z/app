import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { apiFetch } from "@/lib/api/api.client";

const fetchMock = jest.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset(); // efface les anciennes requetes et reponses
  global.fetch = fetchMock;
});

describe("apiFetch", () => {
  it("it should sendback json.data when the response is an 200", async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ data: { id: 1 } }),
    } as unknown as Response);

    const result = await apiFetch<{ id: number }>("/chores");

    expect(result).toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it(" it should sendback undefined when the response is an 204", async () => {
    fetchMock.mockResolvedValue({
      status: 204,
      ok: true,
    } as unknown as Response);

    const result = await apiFetch<void>("/dashboard");

    expect(result).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("it should refresh the access_token after an 401", async () => {
    fetchMock
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
      } as unknown as Response)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
      } as unknown as Response)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({
          data: {
            id: 1,
          },
        }),
      } as unknown as Response);

    const result = await apiFetch<{ id: number }>("/chores");

    expect(result).toEqual({ id: 1 });
    expect(fetchMock.mock.calls[1][0]).toContain("/auth/refresh");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("lance une ApiError avec le statut et le message du back", async () => {
  fetchMock.mockResolvedValueOnce({
    status: 403,
    ok: false,
    json: async () => ({ message: "Compte verrouillé" }),
  } as unknown as Response);

  await expect(apiFetch("/auth/login")).rejects.toMatchObject({
    status: 403,
    message: "Compte verrouillé",
  });
});
});
