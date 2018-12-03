rm thebestdarngirls.zip
cd lambda
npm install
zip -r ../thebestdarngirls.zip *
cd ..
aws lambda update-function-code --function-name NewBestDarnGirls  --zip-file fileb://thebestdarngirls.zip --profile personal
