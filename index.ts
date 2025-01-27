import { serve } from "https://deno.land/std/http/server.ts";

const handler = async (req: Request) => {
  const url = new URL(req.url);
  const youtubeUrl = url.searchParams.get("url");

  if (youtubeUrl) {
    try {
      const process = Deno.run({
        cmd: [
          "python3",
          "-m",
          "yt_dlp",
          "--get-url",
          youtubeUrl
        ],
        stdout: "piped",
        stderr: "piped",
      });

      const output = await process.output();
      const errorOutput = await process.stderrOutput();

      process.close();

      const playbackUrl = new TextDecoder().decode(output).trim();

      if (playbackUrl) {
        const redirectHtml = `
          <meta http-equiv="refresh" content="0; url=${playbackUrl}" />
          <p>Redirecting to playback URL: <a href="${playbackUrl}">${playbackUrl}</a></p>
        `;
        return new Response(redirectHtml, { headers: { "Content-Type": "text/html" } });
      } else {
        return new Response("Could not retrieve playback URL", { status: 400 });
      }
    } catch (e) {
      console.error(e);
      return new Response("Error occurred while fetching playback URL", { status: 500 });
    }
  } else {
    return new Response("No URL provided. Use '?url=YOUTUBE_URL' in the query.", { status: 400 });
  }
};

console.log("Server running on http://localhost:8000");
await serve(handler);
