rm thebestdarngirls.zip
cd lambda
npm install
zip -r ../thebestdarngirls.zip *
cd ..
aws lambda update-function-code --function-name thebestdarngirls-dev  --zip-file fileb://thebestdarngirls.zip --profile personal
