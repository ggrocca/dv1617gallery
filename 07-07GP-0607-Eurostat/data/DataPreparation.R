dataPPS <- read.table("/Users/NicoP/Downloads/DataPPS.csv", header = TRUE, sep = ",", na.string = ":", dec = ".");
dataPPS$Value <- as.numeric(gsub(' ', '', dataPPS$Value));
colnames(dataPPS)[9]<-"PPS";
dataPPS=subset(dataPPS, select=-c(5,8));
dataEuro <- read.table("/Users/NicoP/Downloads/DataEuro.csv", header = TRUE, sep = ",", na.string = ":", dec = ".");
dataEuro$Value <- as.numeric(gsub(' ', '', dataEuro$Value));
colnames(dataEuro)[9]<-"Euro"
dataEuro=subset(dataEuro, select=-c(5,8));
dataHour <- read.table("/Users/NicoP/Downloads/DataHour.csv", header = TRUE, sep = ",", na.string = ":", dec = ".");
dataHour$Value <- as.numeric(gsub(' ', '', dataHour$Value));
colnames(dataHour)[9]<-"Hour"
dataHour=subset(dataHour, select=-c(5,8)); 

colnames(dataHour);
colnames(dataPPS);
colnames(dataHour);

df<-merge(x=dataPPS,y=dataEuro, by.x=c("GEO","TIME","NACE_R2","ISCO08","AGE","SEX"), by.y=c("GEO","TIME","NACE_R2","ISCO08","AGE","SEX"));

df2<-merge(x=df,y=dataHour, by.x=c("GEO","TIME","NACE_R2","ISCO08","AGE","SEX"), by.y=c("GEO","TIME","NACE_R2","ISCO08","AGE","SEX"));

levels(df2$NACE_R2)[2]<-gsub(";",",", levels(df2$NACE_R2)[2])
levels(df2$GEO)[6]<-"Czech Rep.";
levels(df2$GEO)[10]<-"Macedonia";
levels(df2$GEO)[12]<-"Germany";



data2002=df2[df2$TIME=="2002", c("GEO","NACE_R2","ISCO08","AGE","SEX","PPS","Euro","Hour")];
data2006=df2[df2$TIME=="2006", c("GEO","NACE_R2","ISCO08","AGE","SEX","PPS","Euro","Hour")];
data2010=df2[df2$TIME=="2010", c("GEO","NACE_R2","ISCO08","AGE","SEX","PPS","Euro","Hour")];
data2014=df2[df2$TIME=="2014", c("GEO","NACE_R2","ISCO08","AGE","SEX","PPS","Euro","Hour")];

colnames(data2002)[6]<-"PPS2002";
colnames(data2006)[6]<-"PPS2006";
colnames(data2010)[6]<-"PPS2010";
colnames(data2014)[6]<-"PPS2014";

colnames(data2002)[7]<-"EURO2002";
colnames(data2006)[7]<-"EURO2006";
colnames(data2010)[7]<-"EURO2010";
colnames(data2014)[7]<-"EURO2014";

colnames(data2002)[8]<-"HOUR2002";
colnames(data2006)[8]<-"HOUR2006";
colnames(data2010)[8]<-"HOUR2010";
colnames(data2014)[8]<-"HOUR2014";

df3<-merge(x=data2002,y=data2006, by.x=c("GEO","NACE_R2","ISCO08","AGE","SEX"), by.y=c("GEO","NACE_R2","ISCO08","AGE","SEX"));
df4<-merge(x=df3,y=data2010, by.x=c("GEO","NACE_R2","ISCO08","AGE","SEX"), by.y=c("GEO","NACE_R2","ISCO08","AGE","SEX"));
data<-merge(x=df4,y=data2014, by.x=c("GEO","NACE_R2","ISCO08","AGE","SEX"), by.y=c("GEO","NACE_R2","ISCO08","AGE","SEX"));

SEX=levels(data$SEX);
AGE=levels(data$AGE);
NACE_R2=levels(data$NACE_R2);
ISCO08=levels(data$ISCO08);

count=0;

for (i in 1:length(SEX))
{   
	path=paste("/Users/NicoP/htdocs/prova/data",SEX[i], sep="/");
	dir.create(path, showWarnings = TRUE, recursive = FALSE);
	for (j in 1:length(AGE))
	{
		path1=paste(path, AGE[j] , sep='/');
		dir.create(path1, showWarnings = TRUE, recursive = FALSE);
		for (k in 1:length(NACE_R2))
		{
			path2=paste(path1, NACE_R2[k], sep='/');
			dir.create(path2, showWarnings = TRUE, recursive = FALSE);
			for (l in 1:length(ISCO08))
			{
			data2=data[data$SEX==SEX[i] & data$AGE==AGE[j] & data$NACE_R2==NACE_R2[k] & data$ISCO08==ISCO08[l], c("GEO","NACE_R2","ISCO08","AGE","SEX","PPS2002","EURO2002","HOUR2002","PPS2006","EURO2006","HOUR2006","PPS2010","EURO2010","HOUR2010","PPS2014","EURO2014","HOUR2014")] ;
			
			path3=paste(path2, ISCO08[l], sep='/');
			dir.create(path3, showWarnings = TRUE, recursive = FALSE);
			path4=paste(path3, "/datatot.csv", sep="");
			write.table(data2, file=path4, quote=T, sep=",", dec=".", na="NA", row.names=F, col.names=T);
			path4=paste(path3, "/data.csv", sep="");
			data3=data2[, c("GEO","PPS2002","EURO2002","HOUR2002","PPS2006","EURO2006","HOUR2006","PPS2010","EURO2010","HOUR2010","PPS2014","EURO2014","HOUR2014")] ;
			write.table(data3, file=path4, quote=T, sep=",", dec=".", na="NA", row.names=F, col.names=T);
			count=count+1;
			}
	
		}
	}
}


