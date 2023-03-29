# Triage GPT

A [Fine Tuned](https://platform.openai.com/docs/guides/fine-tuning) GPT-3 model for triaging [WooCommerce incoming issues](https://github.com/woocommerce/woocommerce/issues).

## Usage

You'll need [an OpenAI key](https://platform.openai.com/account/api-keys) to make requests to the model and make sure the `OPENAI_API_KEY` variable is available.

```
export OPENAI_API_KEY="<OPENAI_API_KEY>"
```

Install dependencies.

```
pip install --upgrade openai
npm install
```

Run the progam by feeding it an issue number.

```
node index.js triage <IssueNumber>
```
