
#import "Jxcore.h"


extern void do_test_jxcore();

@implementation Jxcore



-(void) getPlatformName:(id<IMethodResult>)methodResult {
    do_test_jxcore();
    [methodResult setResult:@"iOS"];
}

-(void) calcSumm:(int)a b:(int)b methodResult:(id<IMethodResult>)methodResult {
    [methodResult setResult:[NSNumber numberWithInt:(a+b)]];
}

-(void) joinStrings:(NSString*)a b:(NSString*)b methodResult:(id<IMethodResult>)methodResult {
    [methodResult setResult:[a stringByAppendingString:b]];
}




@end
