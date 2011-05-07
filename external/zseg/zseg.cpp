#include <stdio.h>
#include <stdlib.h>
#include <time.h>

/*
zseg源代码
清华大学计算机系自然语言处理组
作者：张开旭 孙茂松
*/
/*缓存大小，标注集大小*/
const int max_length=10000;
const int tagset_size=4;

/*输入的缓存，及长度*/
int sequence[max_length];
int len=0;

/*维特比解码使用的数组以及结果*/
int values[max_length][tagset_size];
int pointers[max_length][tagset_size];//回指指针
int result[max_length];//标注结果

int tagbigram01=23195;
int tagbigram02=33651;
int tagbigram11=27739;
int tagbigram12=22408;
int tagbigram20=24123;
int tagbigram23=22971;
int tagbigram30=26115;
int tagbigram33=28485;
int diffb;int diffm;int diffe;int diffs;



/*字unigram特征与字bigram特征的双数组trie树*/
int * bi_base_array;
int * bi_check_array;
int bi_da_size;
int * uni_base_array;
int * uni_check_array;
int uni_da_size;

/*初始化一个双数组trie树*/
void load_da(char* filename,int* &base_array,int* &check_array,int &size){
    //打开文件
    FILE * pFile=fopen ( filename , "rb" );
    /*得到文件大小*/
    fseek (pFile , 0 , SEEK_END);
    size=ftell (pFile)/4/2;//双数组大小
    rewind (pFile);//重置文件指针到开头
    /*前一半是base数组，后一半是check数组*/
    base_array=(int*) malloc (sizeof(int)*size);
    check_array=(int*) malloc (sizeof(int)*size);
    fread (base_array,4,size,pFile);
    fread (check_array,4,size,pFile);
    //关闭文件
    fclose (pFile);
};

/*检索unigram trie树的特征值*/
inline int* find_u(int c1){
    if(c1>=uni_da_size||uni_check_array[c1]!=0)
        return NULL;
    return uni_base_array+uni_base_array[c1]+33;
};

/*检索bigram trie树的特征值*/
inline int* find_b(int c1,int c2){
    if(c1>=bi_da_size||bi_check_array[c1]!=0)
        return NULL;
    c2=bi_base_array[c1]+c2;
    if(c2>=bi_da_size||bi_check_array[c2]!=c1)
        return NULL;
    return bi_base_array+bi_base_array[c2]+33;
};

/*动态规划算法*/
int dp(){
   /*search*/
   int d32;
   int d10;
   for(int i=1;i<len;i++){
    d32=values[i-1][3]-values[i-1][2];
    d10=values[i-1][1]-values[i-1][0];
    if(diffb>d32){//b<-e,s
        values[i][0]+=values[i-1][2]+tagbigram20;pointers[i][0]=2;
        if(diffs>d32){//s<-e,s
            values[i][3]+=values[i-1][2]+tagbigram23;pointers[i][3]=2;
        }else{
            values[i][3]+=values[i-1][3]+tagbigram33;pointers[i][3]=3;
        }
    }else{
        values[i][0]+=values[i-1][3]+tagbigram30;
        values[i][3]+=values[i-1][3]+tagbigram33;
        pointers[i][0]=pointers[i][3]=3;
    }
    if(diffm>d10){//m<-b,m
        values[i][1]+=values[i-1][0]+tagbigram01;
        values[i][2]+=values[i-1][0]+tagbigram02;
        pointers[i][1]=pointers[i][2]=0;
    }else{
        values[i][1]+=values[i-1][1]+tagbigram11;pointers[i][1]=1;
        if(diffe>d10){//e<-b,m
            values[i][2]+=values[i-1][0]+tagbigram02;pointers[i][2]=0;
        }else{
            values[i][2]+=values[i-1][1]+tagbigram12;pointers[i][2]=1;
        }
    }
   }
   /*find max*/
   int max_ind=0;
   int offset=len-1;
   for(int i=0;i<tagset_size;i++)
      if(values[offset][max_ind]<=values[offset][i])max_ind=i;
   result[offset]=max_ind;
   /*find sequence*/
   while(offset){
      max_ind=pointers[offset][max_ind];
      offset--;
      result[offset]=max_ind;
   }
};

/*使用双数组trie树查表为动态规划程序搜使用的数据初始化*/
void put_values(){
    //清零
    values[0][0]=0;values[0][1]=0;
    values[0][2]=0;values[0][3]=0;
    /*每一个字的unigram，与它邻接的共3个字的标注有关，每个字有4种标注，
    所以需要赋予12个不同的特征值*/
    for(int i=0;i<len;i++){
        int* p=find_u(sequence[i]);
        if(p==NULL){
            if(i+1<len){
                values[i+1][0]=0;values[i+1][1]=0;
                values[i+1][2]=0;values[i+1][3]=0;
            }
            continue;
        }
        if(i>0){
            values[i-1][0]+=*(p++);values[i-1][1]+=*(p++);
            values[i-1][2]+=*(p++);values[i-1][3]+=*(p++);
        }else p+=4;
        values[i][0]+=*(p++);values[i][1]+=*(p++);
        values[i][2]+=*(p++);values[i][3]+=*(p++);
        if(i+1<len){
            values[i+1][0]=*(p++);values[i+1][1]=*(p++);
            values[i+1][2]=*(p++);values[i+1][3]=*(p++);
        }
    }
    /*每一个字的bigram，与它邻接的共4个字的标注有关，每个字有4种标注，
    所以需要赋予16个不同的特征值*/
    for(int i=0;i<len-1;i++){
        //用双数组trie树找到该bigram对应的16个特征的特征值指针
        int* p=find_b(sequence[i],sequence[i+1]);
        if(p==NULL)continue;
        if(i>0){
            values[i-1][0]+=*(p++);values[i-1][1]+=*(p++);
            values[i-1][2]+=*(p++);values[i-1][3]+=*(p++);
        }else p+=4;
        values[i][0]+=*(p++);values[i][1]+=*(p++);
        values[i][2]+=*(p++);values[i][3]+=*(p++);
        values[i+1][0]+=*(p++);values[i+1][1]+=*(p++);
        values[i+1][2]+=*(p++);values[i+1][3]+=*(p++);
        if(i+2<len){
            values[i+2][0]+=*(p++);values[i+2][1]+=*(p++);
            values[i+2][2]+=*(p++);values[i+2][3]+=*(p++);
        }
    }
};

/*对缓存里的串分词并编码成utf-8输出*/
void output(){
    put_values();//检索出特征值并初始化放在values数组里
    dp();//动态规划搜索最优解放在result数组里
    int c;
    for(int i=0;i<len;i++){
        c=sequence[i];
        if(c<128){//1个byte的utf-8
            putchar(c);
        }else if(c<0x800){//2个byte的utf-8
            putchar(0xc0|(c>>6));
            putchar(0x80|(c&0x3f));
        }else{//3个byte的utf-8
            putchar(0xe0|((c>>12)&0x0f));
            putchar(0x80|((c>>6)&0x3f));
            putchar(0x80|(c&0x3f));
        }
        //在分词位置输出空格
        if((result[i]>1)&&((i+1)<len)
           //&&((sequence[i]>128)||(sequence[i+1]>128))
           )
            putchar(' ');
    }
}
int main () {
    //初始化字unigram特征与字bigram特征的双数组trie树
  load_da("da_b.bin",bi_base_array,bi_check_array,bi_da_size);
  load_da("da_u.bin",uni_base_array,uni_check_array,uni_da_size);
  //初始化标注的bigram特征值//BMES

   diffb=tagbigram20-tagbigram30;
   diffm=tagbigram01-tagbigram11;
   diffe=tagbigram02-tagbigram12;
   diffs=tagbigram23-tagbigram33;



    //jprintf("===zseg 作者：张开旭 孙茂松===\n");
    //printf("===UTF-8 encoding is required===\n");
    clock_t before;
    double elapsed;
    before=clock();//开始计时

    /*
     这里是主循环
     在这里，不停的读入utf-8编码的字符，根据其编码格式解码。
     如果是一般字符，放入缓存等待分词。
     如果是非打印字符（如回车）或者空格，则对缓存中的字符串分词输出，
        接着输出该字符。
    直到文件末尾结束。
    */
    int c;
    while(1){//反复读取输入流直到文件末尾
        c=getchar();
        if(c==EOF){
            if(len)output();
            fflush(stdout);
            break;
        }
        if(!(c&0x80)){//1个byte的utf-8编码
            if(c<=32){//非打印字符及空格
                if(len)output();//对缓存中的串分词并输出
                len=0;//清空缓存
                putchar(c);
                fflush(stdout);//flush输出流，即时的显示出去。
            }else{//一般ascii字符
                sequence[len++]=c+65248;//半角转全角，放入缓存
            }
        }else if(!(c&0x20)){//2个byte的utf-8编码
            sequence[len++]=((c&0x1f)<<6)|
                (getchar()&0x3f);
        }else if(!(c&0x10)){//3个byte的utf-8编码
            sequence[len++]=((c&0x0f)<<12)|
                ((getchar()&0x3f)<<6)|
                (getchar()&0x3f);
        }else{//更大的unicode编码不能处理
            break;
        }
    }
    //计算解码时间
    elapsed=clock()-before;
    //printf("===finished. %3f seconds===\n",elapsed/CLOCKS_PER_SEC);
    return 0;
}
