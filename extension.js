const vscode = require("vscode");
const axios = require("axios");
const xml2js = require("xml2js");
const https = require("https");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  https.globalAgent.options.rejectUnauthorized = false;
  const res = await axios.get("https://blog.webdevsimplified.com/rss.xml");

  const xmlOptions = {
    explicitArray: false, // Ensures that items are not wrapped in arrays
  };

  const parser = new xml2js.Parser(xmlOptions);
  const parseString = require("util").promisify(parser.parseString);

  try {
    const parsedData = await parseString(res.data);

    // Access the RSS items
    const items = parsedData.rss.channel.item;

    if (items && Array.isArray(items)) {
      const articles = items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .map(article => {
          return {
            label: article.title,
            detail: article.description,
            link: article.link,
          };
        });

      let disposable = vscode.commands.registerCommand(
        "test-step-dias.search",
        async function () {
          const article = await vscode.window.showQuickPick(articles, {
            matchOnDetail: true,
          });

          if (article == null) return;

          vscode.env.openExternal(article.link);
        });

      context.subscriptions.push(disposable);
    } else {
      console.error("Invalid RSS data structure.");
    }
  } catch (error) {
    console.error("Error parsing XML:", error);
  }
}

exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
