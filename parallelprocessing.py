from pyspark.sql import SparkSession
from pyspark import SparkContext

file = open('languages.txt','w')
sc = SparkContext()

spark = SparkSession.builder.config("spark.sql.warehouse.dir", "/home/shree/DataManagement/Project").appName("parallelprocessing").getOrCreate()

tweets = spark.read.json('tweets.txt').rdd

languages = tweets.map(lambda x: x['data']['lang']).collect()

temp = sc.parallelize(languages,4).countByValue().items()

st = "Language,Count\n"

for (i,j) in temp:
	st = st+str(i)+","+str(j)+'\n'
	
file.write(st)
	

