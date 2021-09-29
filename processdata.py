import json

count = 0
result_list = []

with open('tweets.txt', 'r') as datafile:
    content = datafile.readlines()

for json_str in content:
    if json_str != '\n':
        result = json.loads(json_str)
        result_list.append(result['data'])

print(result_list[0])

result_list = json.dumps(result_list, ensure_ascii=False)
# print(result_list)
with open('dataset.json','w') as dataset:
    dataset.write(result_list)




