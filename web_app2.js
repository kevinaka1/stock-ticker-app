const url = require('url');
const http = require('http');
const { MongoClient, ServerApiVersion } = require("mongodb");

const port = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    let reqUrlParts = url.parse(req.url, true);

    if (req.url == "/") {
        res.write('<form action="/process" method="get" id="myForm">');
        res.write('<input type="radio" name="tickerOrCompany" id="ticker_radio" value="ticker_radio">');
        res.write('<label for="ticker">Stock Ticker </label>');
        res.write('<input type="text" name="ticker" id="ticker_text" autocomplete autofocus>');
        res.write('<br> <br>');
        res.write('<input type="radio" name="tickerOrCompany" id="company_radio" value="company_radio">');
        res.write('<label for="company">Company Name </label>');
        res.write('<input type="text" name="company" id="company_text" autocomplete autofocus>');
        res.write('<br> <br>');
        res.write('<button type="submit" id="submit-btn">Submit</button>')
        res.write('</form>');


    }
    else if (reqUrlParts.pathname == "/process") {
        let qobj = url.parse(req.url, true).query;
        const uri = "mongodb+srv://kevinaka:EbnCnG6hI91H5Bqs@cluster0.vzubs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const databaseOperations = async () => {
            const client = new MongoClient(uri, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                }
            });
            try {
                await client.connect();

                console.log("Connected to databse");

                const dbObj = client.db("Stock");
                const publicCompanies = dbObj.collection("PublicCompanies");
                let query = null;
                if (qobj.tickerOrCompany === "company_radio") {
                    query = { "company_name": `/ ${qobj.company} /` };
                }
                else if (qobj.tickerOrCompany === "ticker_radio") {
                    query = { "stock_ticker": `/ ${qobj.ticker} /` };
                }
                console.log(query);
                else {
                    res.write("You didn't choose whether you wanted to search based on ticker or company name.");
                }

                if (query != null) {
                    const companies = await publicCompanies.find(query).toArray();

                    if (companies.length === 0) {
                        res.write("This company is not in our database");
                    }
                    else {
                        companies.forEach(company => {
                            console.log(company.company_name);
                            console.log(company.stock_ticker);
                            console.log(company.price);

                            res.write("<br>");
                            res.write(company.company_name);
                            res.write("<br>");
                            res.write(company.stock_ticker);
                            res.write("<br>");
                            res.write(company.price);
                            res.write("<br>");
                        });
                    }
                }
            }
            catch (err) {
                console.log(`Error connecting to databse: ${err}`);
            }
            finally {
                await client.close();
                res.end();
            }
        }

        databaseOperations();

    }


}).listen(port);
