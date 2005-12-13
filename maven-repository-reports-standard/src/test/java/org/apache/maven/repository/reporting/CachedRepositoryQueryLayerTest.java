package org.apache.maven.repository.reporting;

/*
 * Copyright 2001-2005 The Apache Software Foundation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *
 */
public class CachedRepositoryQueryLayerTest
    extends AbstractRepositoryQueryLayerTest
{
    protected void setUp() throws Exception
    {
        super.setUp();
        
        queryLayer = new CachedRepositoryQueryLayer( repository );
    }
    
    public void testUseFileCache()
    {
        testContainsArtifactTrue();
        assertEquals( 0, queryLayer.getCacheHitRate(), 0 );
        testContainsArtifactTrue();
        assertEquals( 0.50, queryLayer.getCacheHitRate(), 0 );
    }
    
    public void testUseMetadataCache()
        throws Exception
    {
        testArtifactVersionsTrue();
        assertEquals( 0, queryLayer.getCacheHitRate(), 0 );
        testArtifactVersionsTrue();
        assertEquals( 0.50, queryLayer.getCacheHitRate(), 0 );
    }
    
    public void testUseFileCacheOnSnapshot()
    {
        testContainsSnapshotArtifactTrue();
        assertEquals( 0, queryLayer.getCacheHitRate(), 0 );
        testContainsSnapshotArtifactTrue();
        assertEquals( 0.50, queryLayer.getCacheHitRate(), 0 );
    }
}
