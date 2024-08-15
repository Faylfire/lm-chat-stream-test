# ChatCompletion using LMStudio

This project is a simple exploration of implementing streaming chat with LM Studio's API using openai api and fetch and looking at differences and difficulties.

Discoveries:
- AbortController is used to stop the request, and does not seem to effect the inference
- If AbortController successfully stops the request such as fetch and breaks connection to the inference server (in this case LMStudio LocalServer) the inference will stop shortly
- Sending AbortController signals only work with fetch through the signal parameter, openai api with signal parameter does not seem to work, possibly due to the parameter not being passed to the right place to stop the request
- With Openai a more direct brute force approach is to test for the abortsignal directly in the code and raise an error to cut the stream.

```javascript
      const response = await fetch(
        "http://localhost:1234/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model:
              "model-name",
            messages: userMessageWithContext,
            stream: true,
            temperature: 0.7,
            max_tokens: -1,
          }),
          signal: abortControllerRef.current.signal, // Pass the abort signal
        }
      );
```

# React + Vite

This project uses a Vite with React template which provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
