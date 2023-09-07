import { createWriteStream, mkdtempSync, readFileSync } from "fs";
import { RequestOptions, get } from "https";
import { tmpdir } from "os";
import { basename, join } from "path";
import { URL } from "url";

export const downloadFile = async (remoteUrl: string): Promise<string> => {
  const url = new URL(remoteUrl);
  const host = url.hostname;
  const path = url.pathname;

  const token = process.env.GITHUB_TOKEN;
  const headers = token ? { Authorization: `token ${token}` } : undefined;

  const options: RequestOptions = {
    host: host,
    port: 443,
    path: path,
    method: "GET",
    rejectUnauthorized: false,
    headers,
    agent: false,
  };

  const filename = basename(path);
  const tempDir = mkdtempSync(join(tmpdir(), "jira-flow-metrics"));
  const tempFile = join(tempDir, filename);

  const promise = new Promise<string>((resolve, reject) => {
    const file = createWriteStream(tempFile);

    const request = get(options, (response) => {
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        const content = readFileSync(tempFile, { encoding: "utf8" });
        resolve(content);
      });
    });

    request.end();

    request.on("error", function (e) {
      reject(e);
    });
  });

  return promise;
};
