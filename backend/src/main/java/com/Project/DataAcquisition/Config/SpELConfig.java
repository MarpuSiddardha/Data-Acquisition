package com.Project.DataAcquisition.Config;


import org.springframework.context.annotation.Configuration;
import org.springframework.expression.spel.support.StandardEvaluationContext;

@Configuration
public class SpELConfig {
    public StandardEvaluationContext getContext() {
        return new StandardEvaluationContext();
    }
}
